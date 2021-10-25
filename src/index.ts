class Factorization
{
  //dictionary<prime number, power>
  private _factors: Map<number, number>;
  private _value: number;

  private constructor(factors: Map<number, number>, value?: number)
  {
    this._factors = factors;
    if (undefined === value)
      this._value = getValue();
    else
      this._value = value;

    function getValue()
    {
      return Array
        .from(factors.entries())
        .map(factor => (factor[0])**(factor[1]))
        .reduce((acc, item) => acc * item);
    }
  }

  get value()
  {
    return this._value;
  }

  get factors()
  {
    return this._factors;
  }

  static createFromFactors(factors: Map<number, number>)
  {
    return new Factorization(factors);
  }

  static createFromNumber(val: number)
  {
    let factors = new Map<number, number>();
    let primeGen = createPrimeGenerator();
    let currentNum = val;

    for(let currentPrime of primeGen)
    {
      if (currentPrime**2 > currentNum)
        break;

      pushFactor(currentPrime, getPower(currentPrime));
    }
    
    pushFactor(currentNum, 1);
    return new Factorization(factors, val);

    function getPower(currentPrime: number)
    {
      let currentPower = 0;
      while (0 === currentNum % currentPrime)
      {
        ++currentPower;
        currentNum /= currentPrime;
      }

      return currentPower;
    }

    function pushFactor(prime: number, power: number)
    {
      if (prime < 2 || power < 1)
        return;

      factors.set(prime, power);
    }

    function* createPrimeGenerator(): Generator<number>
    {
      yield 2;
      yield 3;
      let prime = 3;
      while (true)
      {
        prime += 2;
        yield prime;
        prime += 2;
        yield prime;
        prime += 2;
      }
    }
  }

  remove(prime: number, power: number)
  {
    let currentPower = this._factors.get(prime);
    if (undefined === currentPower)
      return;

    this._value /= prime**power;
    if (power < currentPower)
      this._factors.set(prime, currentPower - power);
    else
      this._factors.delete(prime);
  }

  copy()
  {
    return new Factorization(new Map(this._factors), this._value);
  }

  multiply(factorization: Factorization)
  {
    let result = this.copy();
    result._value *= factorization._value;

    for(let [prime, power] of factorization.factors.entries())
    {
      let factorPower = result.factors.get(prime);
      let currentPower = factorPower ?? 0;

      result._factors.set(prime, currentPower + power);
    }

    return result;
  }

  toString()
  {
    let factorization = Array
      .from(this._factors.entries())
      .map(factor => getFactorToString(factor[0], factor[1]))
      .join("*");

    return `${this._value}: ${factorization}`;

    function getFactorToString(prime: number, power: number)
    {
      if (1 === power)
        return prime.toString();

      return `${prime}^${power}`;
    }
  }
}

class Fraction
{
  private _numerator: Factorization;
  private _denominator: Factorization;

  private constructor(private numerator: Factorization, private denominator: Factorization)
  {
    if (0 === numerator.value)
    {
      this._numerator = numerator;
      this._denominator = Factorization.createFromNumber(1);
      return;
    }
      
    [this._numerator, this._denominator] = this.simplify(numerator, denominator);
  }

  simplify(numerator: Factorization, denominator: Factorization): [Factorization, Factorization]
  {
    let num = numerator.copy();
    let denom = denominator.copy();

    for(let [prime, denominatorPower] of denominator.factors.entries())
    {
      let power = numerator.factors.get(prime);
      if (undefined === power)
        continue;
      
      let commonPower = Math.min(power, denominatorPower);
      num.remove(prime, commonPower);
      denom.remove(prime, commonPower);
    }

    return [num, denom];
  }

  static createFromFrac(numerator: number, denominator: number)
  {
    return new Fraction(Factorization.createFromNumber(numerator), Factorization.createFromNumber(denominator));
  }

  static createFromFactors(numerator: Factorization, denominator: Factorization)
  {
    return new Fraction(numerator, denominator);
  }

  static createFromStr(fractionStr: string)
  {
    let numerator = 0;
    let denominator = 1;
    let nums = fractionStr.split('/');
    if (nums.length > 1)
    {
      numerator = parseInt(nums[0]);
      denominator = parseInt(nums[1]);
      return new Fraction(Factorization.createFromNumber(numerator), Factorization.createFromNumber(denominator));
    }
    
    nums = fractionStr.split('.');
    if (nums.length > 1)
    {
      numerator = parseInt(nums[1]);
      denominator = 10**(nums[1].length);
    }
    numerator += parseInt(nums[0])*denominator;
    return new Fraction(Factorization.createFromNumber(numerator), Factorization.createFromNumber(denominator));
  }

  add(frac: Fraction)
  {
    let num = this._numerator.value * frac._denominator.value + frac._numerator.value * this._denominator.value;
    let denom = this._denominator.multiply(frac._denominator);
    return new Fraction(Factorization.createFromNumber(num), denom);
  }

  minus(frac: Fraction)
  {
    let num = this._numerator.value * frac._denominator.value - frac._numerator.value * this._denominator.value;
    let denom = this._denominator.multiply(frac._denominator);
    return new Fraction(Factorization.createFromNumber(num), denom);
  }

  multiply(frac: Fraction)
  {
    let num = this._numerator.multiply(frac._numerator);
    let denom = this._denominator.multiply(frac._denominator);
    return new Fraction(num, denom);
  }

  divide(frac: Fraction)
  {
    return this.multiply(frac.inverse());
  }

  inverse()
  {
    return new Fraction(this._denominator, this._numerator);
  }

  toString()
  {
    return `${this._numerator.value}/${this._denominator.value}`;
  }
}


// let factor = Factorization.createFromNumber(1);
// console.log(factor.toString());
let frac = Fraction.createFromStr("1/20").multiply(Fraction.createFromStr("10/3")).add(Fraction.createFromStr("1/6"));
console.log(frac.toString());