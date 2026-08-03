import { classifyHealthLogError } from './errors';

describe('health log errors', () => {
  it('distinguishes session and RLS errors', () => {
    expect(classifyHealthLogError({ status: 401 }, 'list').kind).toBe('session');
    expect(classifyHealthLogError({ status: 403 }, 'detail').kind).toBe('rls');
    expect(classifyHealthLogError({ code: '42501' }, 'create').kind).toBe('rls');
  });

  it('distinguishes missing rows and network errors', () => {
    expect(classifyHealthLogError({ code: 'PGRST116' }, 'detail').kind).toBe('not_found');
    expect(classifyHealthLogError({ message: 'Failed to fetch' }, 'list').kind).toBe('network');
  });

  it('redacts credentials from technical messages', () => {
    const error = classifyHealthLogError({ status: 403, message: 'Bearer private-token password=hidden eyJabc.def.ghi' }, 'delete');
    expect(error.technical.message).not.toContain('private-token');
    expect(error.technical.message).not.toContain('hidden');
    expect(error.technical.message).not.toContain('eyJabc.def.ghi');
  });
});
