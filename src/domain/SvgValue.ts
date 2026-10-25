export class SvgValue {
  static number(value: string | number, name = 'number'): number {
    const source = String(value);
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(source)) {
      throw new Error(`invalid ${name}: ${source}`);
    }
    const result = Number(source);
    if (!Number.isFinite(result)) throw new Error(`invalid ${name}: ${source}`);
    return Object.is(result, -0) ? 0 : result;
  }

  static positive(value: string | number, name: string): number {
    const result = this.number(value, name);
    if (result <= 0) throw new Error(`${name} must be positive`);
    return result;
  }

  static nonnegative(value: string | number, name: string): number {
    const result = this.number(value, name);
    if (result < 0) throw new Error(`${name} must be non-negative`);
    return result;
  }

  static text(value: string): string {
    if (/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u.test(value)) {
      throw new Error('invalid XML character');
    }
    return value;
  }

  static id(value: string): string {
    if (!value || /\s/.test(value)) throw new Error(`invalid id: ${value}`);
    return this.text(value);
  }
}
