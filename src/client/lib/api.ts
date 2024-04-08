import ky from 'ky';

export const api = ky.create({
  prefixUrl: '/api',
  retry: { limit: 0 },
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response && response.body) {
          const json = await response.json();
          error.name = 'API Error';
          error.message = json.message;
        }

        return error;
      },
    ],
  },
});
