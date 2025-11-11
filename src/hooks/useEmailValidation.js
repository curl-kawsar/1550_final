import { useMutation } from '@tanstack/react-query';

const validateEmail = async (email) => {
  const response = await fetch('/api/validate-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Validation failed');
  }

  return response.json();
};

export const useEmailValidation = () => {
  return useMutation({
    mutationFn: validateEmail,
    retry: false
  });
};