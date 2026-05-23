import './styles.css';
import heroImage from './assets/hero-developer.png';

const hero = document.querySelector('.hero');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const contactForm = document.querySelector('#contactForm');
const formMessage = document.querySelector('#formMessage');
const aiForm = document.querySelector('#aiForm');
const aiMessage = document.querySelector('#aiMessage');

if (hero) {
  hero.style.setProperty('--hero-image', `url("${heroImage}")`);
}

menuToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('.form-submit');
  const payload = Object.fromEntries(new FormData(contactForm).entries());

  clearFieldErrors();
  setFormMessage(formMessage, '', '');

  const clientErrors = validateContact(payload);

  if (Object.keys(clientErrors).length > 0) {
    showFieldErrors(clientErrors);
    setFormMessage(formMessage, 'Проверьте поля формы.', 'error');
    return;
  }

  setLoading(submitButton, true, 'Отправляю...');

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      if (result.errors) {
        showFieldErrors(result.errors);
      }

      throw new Error(result.message || 'Не удалось отправить сообщение.');
    }

    contactForm.reset();
    setFormMessage(formMessage, result.message, 'success');
  } catch (error) {
    setFormMessage(formMessage, error.message || 'Сервер временно недоступен.', 'error');
  } finally {
    setLoading(submitButton, false, 'Отправить сообщение');
  }
});

aiForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = aiForm.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(aiForm).entries());

  setFormMessage(aiMessage, '', '');
  setLoading(submitButton, true, 'Генерирую...');

  try {
    const response = await fetch('/api/ai-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || 'Не получилось сгенерировать summary.');
    }

    const source = result.source === 'openai' ? 'OpenAI API' : 'локальный fallback';
    setFormMessage(aiMessage, `${result.summary} Источник: ${source}.`, 'success');
  } catch (error) {
    setFormMessage(aiMessage, error.message || 'AI helper временно недоступен.', 'error');
  } finally {
    setLoading(submitButton, false, 'Сгенерировать summary');
  }
});

function validateContact(data) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+\d][\d\s\-()]{7,19}$/;

  if (String(data.name || '').trim().length < 2) {
    errors.name = 'Введите имя от 2 символов.';
  }

  if (!phonePattern.test(String(data.phone || '').trim())) {
    errors.phone = 'Введите корректный телефон.';
  }

  if (!emailPattern.test(String(data.email || '').trim())) {
    errors.email = 'Введите корректный email.';
  }

  if (String(data.comment || '').trim().length < 10) {
    errors.comment = 'Комментарий должен быть не короче 10 символов.';
  }

  return errors;
}

function showFieldErrors(errors) {
  Object.entries(errors).forEach(([name, message]) => {
    const field = document.querySelector(`[name="${name}"]`);
    const error = document.querySelector(`[data-error-for="${name}"]`);

    field?.classList.add('is-invalid');

    if (error) {
      error.textContent = message;
    }
  });
}

function clearFieldErrors() {
  document.querySelectorAll('.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  document.querySelectorAll('[data-error-for]').forEach((error) => {
    error.textContent = '';
  });
}

function setFormMessage(target, message, type) {
  if (!target) {
    return;
  }

  target.textContent = message;
  target.dataset.type = type;
}

function setLoading(button, isLoading, text) {
  if (!button) {
    return;
  }

  button.disabled = isLoading;
  button.textContent = text;
}
