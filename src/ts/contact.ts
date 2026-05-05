document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm') as HTMLFormElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const emailError = document.getElementById('emailError');
  const formMessage = document.getElementById('formMessage');

  emailInput?.addEventListener('input', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailError) {
      emailError.textContent = emailRegex.test(emailInput.value) ? '' : 'Invalid email format';
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (formMessage) {
      formMessage.innerHTML = '<p class="form-success">Thank you! Your message has been sent.</p>';
      form.reset();
    }
  });
});
