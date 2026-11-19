import {createHmac, timingSafeEqual, randomBytes, createHash} from 'node:crypto';
const hash = value => createHash('sha256').update(value).digest();
export function createResearcherAuth(secret,secure) {
  if (typeof secret !== 'string' || secret.length < 32) throw Error('Defina RESEARCHER_TOKEN privado, com pelo menos 32 caracteres.');
  const name = 'study_researcher';
  const sign = text => createHmac('sha256',secret).update(text).digest('hex');
  const cookie = (value,age) => `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;
  const authenticated = request => {
    const value = (request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);
    const parts = value?.split('.') || [];
    if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
    return Number(parts[0]) > Date.now() && timingSafeEqual(Buffer.from(parts[2]),Buffer.from(sign(parts[0]+'.'+parts[1])));
  };
  return {
    authenticated,
    login(value) {
      if (typeof value !== 'string' || !timingSafeEqual(hash(value),hash(secret))) return null;
      const payload = (Date.now()+8*3600000)+'.'+randomBytes(16).toString('hex');
      return cookie(payload+'.'+sign(payload),8*3600);
    },
    logout:()=>cookie('',0)
  };
}
