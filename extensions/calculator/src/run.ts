import type { RunInput, FunctionRunResult, CartLine } from "../generated/api";

function isValidInsurance(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const parsed = JSON.parse(value.toLowerCase());
    return typeof parsed === "boolean" && parsed === true;
  } catch {
    return false;
  }
}
export function run(input: RunInput): FunctionRunResult {
  const isInsurance = input.cart.isInsurance?.value;
  const insuranceCost = Number(input.cart.insuranceCost?.value);
  const cartLines = input.cart.lines;

  if (!isInsurance || !isValidInsurance(isInsurance)) {
    return generateUpdateOperation(cartLines, false, insuranceCost);
  }

  return generateUpdateOperation(cartLines, true, insuranceCost);
}

function generateUpdateOperation(
  lines: RunInput["cart"]["lines"],
  insurance: boolean = false,
  cost: number = 6.99
): FunctionRunResult {
  return {
    operations: lines
      .map((line) => {
        let isSample = false;
        let price = Number(line.cost.totalAmount.amount);

        if (
          "title" in line.merchandise &&
          typeof line.merchandise.title === "string"
        ) {
          //onstates method to handling samples, not sure why they wouldn't just have 0 price.
          isSample = line.merchandise.title.toLowerCase() === "0 / 0 / sample";
        }

        if (
          line._custom_price !== null &&
          typeof line._custom_price === "object"
        ) {
          let p = Number(line._custom_price);
          if (p >= 0) {
            isSample = true;
          }
          price = p;
        }

        if (insurance === true) {
          let c = cost * line.quantity;
          price += c;
        }

        if (isSample === true) {
          price = 0;
        }

        return {
          update: {
            cartLineId: line.id,
            price: {
              adjustment: {
                fixedPricePerUnit: {
                  amount: `${(price /= line.quantity)}`,
                },
              },
            },
          },
        };
      })
      .filter(Boolean),
  };
}
