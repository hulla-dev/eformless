import { config } from '../config'
import { flatten } from '../helpers/arrays'
import { merge, objectMap, omit } from '../helpers/objects'
import { convertBackToType, extractValue } from '../helpers/conversion'

describe('Helpers test', () => {
  describe('Arrays', () => {
    const empty = []
    const nested = [['foo'], ['bar']]
    test('[flatten] - Empty array', () => {
      expect(flatten(empty)).toEqual(expect.arrayContaining([]))
    })
    test('[flatten] - Nested array', () => {
      expect(flatten(nested)).toStrictEqual(['foo', 'bar'])
    })
  })
  describe('Objects', () => {
    const obj = { foo: 1, bar: 'bar', baz: new Date() }
    test('[omit] - Empty object', () => {
      expect(omit('x', { x: 'a' })).toEqual({})
    })
    test('[omit] - Remaining properties', () => {
      expect(omit('baz', obj)).toEqual({ foo: 1, bar: 'bar' })
    })
    test('[omit] - Nonexistent property', () => {
      // eslint-disable-next-line
      // @ts-ignore We typecheck property but want to allow type-error for this check
      expect(omit('bul', obj)).toStrictEqual(obj)
    })
    test('[merge] - Basic object merge', () => {
      expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
    })
    test('[merge] - Overwrite properties', () => {
      expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
    })
    test('[merge] - Overwrite & keep property', () => {
      expect(merge({ a: 1 }, { a: 2, b: 3 })).toEqual({ a: 2, b: 3 })
    })
    test('[objectMap] - Object * 2', () => {
      expect(objectMap({ a: 1, b: 2, c: 3 }, (val) => val * 2)).toEqual({ a: 2, b: 4, c: 6 })
    })
  })
  describe('Conversion', () => {
    test('[convertBackToType] - number', () => {
      expect(convertBackToType('241', false, 'number')).toBe(241)
    })
    test('[convertBackToType] - string in number', () => {
      expect(convertBackToType('fa211s', false, 'number')).toBeNaN()
    })
    test('[convertBackToType] - unsupported format (file)', () => {
      try {
        convertBackToType('img', false, 'file')
      } catch (e) {
        expect(e.message).toMatch(/The type of file is unsupported/)
      }
    })
    test('[convertBackToType] - unsupported format (datetime)', () => {
      try {
        convertBackToType('img', false, 'datetime')
      } catch (e) {
        expect(e.message).toMatch(/Detected deprecated input type 'datetime'/)
      }
    })
    test('[extractValue] value - base value', () => {
      expect(extractValue('hello', 'hello', config)).toBe('hello')
    })
    test('[extractValue] value - base value type', () => {
      expect(typeof extractValue('hello', 'hello', config)).toEqual('string')
    })
    test('[extractValue] value - date type', () => {
      expect(extractValue(new Date(), new Date(), config).constructor.name).toBe('Date')
    })
    test('[extractValue] native - value', () => {
      expect(
        extractValue({ nativeEvent: { text: 'a' } }, { nativeEvent: { text: 'b' } }, config),
      ).toEqual('a')
    })
    test('[extractValue] native event fake - return object', () => {
      expect(
        extractValue({ nativeEvent: { foo: 'a' } }, { nativeEvent: { foo: 'c' } }, config),
      ).toStrictEqual({
        nativeEvent: { foo: 'a' },
      })
    })
    test('[extractValue] web native event', () => {
      expect(
        extractValue({ target: { value: 'hi' } }, { target: { value: 'hello' } }, config),
      ).toEqual('hi')
    })
    test('[extractValue] web native event - number', () => {
      expect(
        extractValue(
          { target: { value: '1', type: 'number' } },
          { target: { value: '1', type: 'number' } },
          config,
        ),
      ).toEqual(1)
    })
    test('[extractValue] web native event - radio', () => {
      expect(
        extractValue(
          { target: { checked: true, type: 'radio' } },
          { target: { checked: true, type: 'radio' } },
          config,
        ),
      ).toEqual(true)
    })
    test('[extractValue] web native event - radio with fake value', () => {
      expect(
        extractValue(
          { target: { checked: false, value: true, type: 'radio' } },
          { target: { checked: false, value: true, type: 'radio' } },
          config,
        ),
      ).toEqual(false)
    })
    test('[extractValue] web native event - maintain date type', () => {
      expect(
        extractValue(
          {
            target: {
              value: new Date().toISOString(),
              type: 'datetime-local',
            },
          },
          { target: { value: new Date().toISOString(), type: 'datetime-local' } },
          config,
        ).constructor.name,
      ).toBe('Date')
    })
  })
})
