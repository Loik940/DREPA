// Tests des tokens de présentation du sélecteur de score Journal.
import { getScoreColor } from './score';

// Ces tests couvrent les statuts visuels descriptifs sans leur attribuer de signification médicale.
describe('score selector presentation', () => {
  it('keeps an undeclared score neutral', () => {
    expect(getScoreColor(null)).toBe('textSecondary');
  });

  it('uses descriptive ranges without treating them as a diagnosis', () => {
    expect(getScoreColor(0)).toBe('success');
    expect(getScoreColor(3)).toBe('success');
    expect(getScoreColor(4)).toBe('warning');
    expect(getScoreColor(6)).toBe('warning');
    expect(getScoreColor(7)).toBe('sos');
    expect(getScoreColor(10)).toBe('sos');
  });
});
