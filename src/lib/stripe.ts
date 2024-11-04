import * as net from 'net';
import * as tls from 'tls';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_FREE_PRICE_ID",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_BUSINESS_PRICE_ID",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in the environment variables");
}

export interface HttpClientResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

export class CustomHttpClient implements Stripe.HttpClient {
  requestId = '';

  getClientName(): string {
    return 'OnnasoftHttpClient';
  }

  makeRequest(
    host: string,
    port: string | number,
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: object,
    requestData: string | null,
    protocol: Stripe.HttpProtocol,
    timeout: number
  ): Promise<Stripe.HttpClientResponse<any, any>> {
    return new Promise((resolve, reject) => {
      const postData = requestData || '';

      const requestHeaders = {
        ...headers,
        'Host': host,
        'Content-Length': Buffer.byteLength(postData).toString(),
      };

      let requestString = `${method} ${path} HTTP/1.1\r\n`;
      for (const [key, value] of Object.entries(requestHeaders)) {
        requestString += `${key}: ${value}\r\n`;
      }
      requestString += '\r\n' + postData;

      const socket = new net.Socket();
      socket.setTimeout(timeout);

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timed out'));
      });

      const connectOptions = {
        host: host,
        port: typeof port === 'string' ? parseInt(port, 10) : port,
      };

      const connectCallback = () => {
        let sslSocket: tls.TLSSocket | net.Socket;

        if (protocol === 'https') {
          sslSocket = tls.connect({
            socket: socket,
            servername: host,
          }, () => {
            sslSocket.write(requestString);
          });
        } else {
          sslSocket = socket;
          sslSocket.write(requestString);
        }

        let responseData = '';

        sslSocket.on('data', (chunk) => {
          responseData += chunk.toString();
          if (responseData.includes('\r\n\r\n')) {
            const [headersString, body] = responseData.split('\r\n\r\n');
            const [statusLine, ...headerLines] = headersString.split('\r\n');
            const statusCode = parseInt(statusLine.split(' ')[1]);

            const headers: { [key: string]: string } = {};
            for (const line of headerLines) {
              const [key, value] = line.split(': ');
              headers[key.toLowerCase()] = value;
            }

            resolve({
              getStatusCode: () => statusCode,
              getHeaders: () => headers,
              getRawResponse: () => new String(responseData),
              toStream: (streamCompleteCallback: () => void) => {
                streamCompleteCallback();
                return null;
              },
              toJSON: () => {
                return Promise.resolve(JSON.parse(body)).catch(() => {
                  return Promise.reject(new Error('Failed to parse JSON response'));
                });
              },
            });

            sslSocket.end();
          }
        });

        sslSocket.on('end', () => {
          socket.end();
        });

        sslSocket.on('error', (error) => {
          reject(error);
        });
      };

      socket.connect(connectOptions, connectCallback);

      socket.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Ejemplo de uso con Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-10-28.acacia',
  httpClient: new CustomHttpClient(),
});

export default stripe;