import nodemailer from 'nodemailer';

export async function handleContact(body) {
  const data = normalizeContact(body);
  const errors = validateContact(data);

  if (Object.keys(errors).length > 0) {
    return {
      status: 400,
      body: {
        ok: false,
        message: 'Проверьте поля формы.',
        errors
      }
    };
  }

  try {
    const { transporter, mode } = createTransporter();
    const ownerEmail =
      process.env.OWNER_EMAIL ||
      process.env.SMTP_USER ||
      (mode === 'json' ? 'owner@example.local' : '');

    if (!ownerEmail) {
      return {
        status: 500,
        body: {
          ok: false,
          message: 'Email владельца сайта не настроен.'
        }
      };
    }

    const ownerMail = {
      from: getFromEmail(),
      to: ownerEmail,
      replyTo: data.email,
      subject: `Новая заявка с сайта: ${data.name}`,
      text: buildOwnerText(data),
      html: buildOwnerHtml(data)
    };
    const userMail = {
      from: getFromEmail(),
      to: data.email,
      subject: 'Копия заявки с сайта Amin Portfolio',
      text: buildUserText(data),
      html: buildUserHtml(data)
    };

    const result = await Promise.all([
      transporter.sendMail(ownerMail),
      transporter.sendMail(userMail)
    ]);

    if (mode === 'json') {
      console.log('[mail:owner]', result[0].message);
      console.log('[mail:user]', result[1].message);
    }

    return {
      status: 200,
      body: {
        ok: true,
        message: 'Сообщение отправлено. Копия письма отправлена на ваш email.'
      }
    };
  } catch (error) {
    console.error('Contact form error:', error);
    const isConfigError = error.message === 'SMTP_NOT_CONFIGURED';

    return {
      status: isConfigError ? 500 : 502,
      body: {
        ok: false,
        message: isConfigError
          ? 'SMTP для отправки писем не настроен.'
          : 'Не удалось отправить письмо. Попробуйте позже.'
      }
    };
  }
}

export function normalizeContact(body) {
  return {
    name: String(body?.name || '').trim(),
    phone: String(body?.phone || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    comment: String(body?.comment || '').trim()
  };
}

export function validateContact(data) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+\d][\d\s\-()]{7,19}$/;

  if (data.name.length < 2) {
    errors.name = 'Введите имя от 2 символов.';
  }

  if (!phonePattern.test(data.phone)) {
    errors.phone = 'Введите корректный телефон.';
  }

  if (!emailPattern.test(data.email)) {
    errors.email = 'Введите корректный email.';
  }

  if (data.comment.length < 10) {
    errors.comment = 'Комментарий должен быть не короче 10 символов.';
  }

  return errors;
}

function createTransporter() {
  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
  const mode =
    process.env.MAIL_MODE ||
    (hasSmtpConfig ? 'smtp' : process.env.NODE_ENV === 'production' ? 'smtp' : 'json');

  if (mode === 'json') {
    return {
      mode,
      transporter: nodemailer.createTransport({ jsonTransport: true })
    };
  }

  if (!hasSmtpConfig) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  return {
    mode,
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  };
}

function getFromEmail() {
  return process.env.FROM_EMAIL || process.env.SMTP_USER || 'portfolio@example.local';
}

function buildOwnerText(data) {
  return [
    'Новая заявка с лендинга.',
    '',
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Email: ${data.email}`,
    '',
    `Комментарий: ${data.comment}`
  ].join('\n');
}

function buildUserText(data) {
  return [
    `${data.name}, спасибо за сообщение!`,
    '',
    'Я получил заявку и отвечу в ближайшее время.',
    '',
    'Копия вашего сообщения:',
    `Телефон: ${data.phone}`,
    `Email: ${data.email}`,
    `Комментарий: ${data.comment}`
  ].join('\n');
}

function buildOwnerHtml(data) {
  return `
    <h2>Новая заявка с лендинга</h2>
    <p><b>Имя:</b> ${escapeHtml(data.name)}</p>
    <p><b>Телефон:</b> ${escapeHtml(data.phone)}</p>
    <p><b>Email:</b> ${escapeHtml(data.email)}</p>
    <p><b>Комментарий:</b><br>${escapeHtml(data.comment).replace(/\n/g, '<br>')}</p>
  `;
}

function buildUserHtml(data) {
  return `
    <h2>${escapeHtml(data.name)}, спасибо за сообщение!</h2>
    <p>Я получил заявку и отвечу в ближайшее время.</p>
    <h3>Копия вашего сообщения</h3>
    <p><b>Телефон:</b> ${escapeHtml(data.phone)}</p>
    <p><b>Email:</b> ${escapeHtml(data.email)}</p>
    <p><b>Комментарий:</b><br>${escapeHtml(data.comment).replace(/\n/g, '<br>')}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
