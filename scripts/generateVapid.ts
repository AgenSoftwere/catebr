import { generateVAPIDKeys } from '@/lib/webpush';

const keys = generateVAPIDKeys();
console.log('Chave Pública (VAPID):', keys.publicKey);
console.log('Chave Privada (VAPID):', keys.privateKey);
