// Tests des tons de présentation du sélecteur de score Journal.
import { getScoreTone } from './score';

// Ces tests couvrent les statuts visuels descriptifs sans leur attribuer de signification médicale.
describe('score selector presentation', () => {
  it('keeps an undeclared score neutral', () => {
    expect(getScoreTone(null)).toBe('textSecondary');
  });

  it('uses descriptive ranges without treating them as a diagnosis', () => {
    expect(getScoreTone(0)).toBe('success');
    expect(getScoreTone(3)).toBe('success');
    expect(getScoreTone(4)).toBe('warning');
    expect(getScoreTone(6)).toBe('warning');
    expect(getScoreTone(7)).toBe('high');
    expect(getScoreTone(10)).toBe('high');
  });
});
