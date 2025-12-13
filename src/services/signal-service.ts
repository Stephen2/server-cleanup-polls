import axios from 'axios';

type Params = {
  url: string;
  sender: string;
};

type SendMessageOpts = {
  message: string;
  recipients: string[];
};

export const createSignalService = ({ url, sender }: Params) => {
  const client = axios.create({
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 12e4,
  });

  const sendMessage = async ({ message, recipients }: SendMessageOpts) => {
    type SendMessageData = {
      timestamp: string;
    };

    const response = await client.post<SendMessageData>('/v2/send', {
      message,
      number: sender,
      recipients,
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        timestamp: Number(response.data.timestamp),
      };
    }

    throw new Error(
      `Failed to send Signal message: ${response.status.toString()} ${response.statusText}`,
    );
  };

  return {
    sendMessage,
  };
};

export type { SendMessageOpts };
