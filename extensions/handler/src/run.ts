import { RunInput, FunctionRunResult } from "../generated/api";
import { A, B, C, D } from "./data";

function findPostcodeBand(arr: string[], postcode: string): boolean {
  const postcodePrefix = postcode.split(" ")[0].toUpperCase();
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const prefix = arr[mid];

    if (postcodePrefix.startsWith(prefix)) {
      return true;
    } else if (prefix < postcodePrefix) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return arr.includes(postcodePrefix);
}

function validatePostcode(postcode: string, value: number) {
  const isSampleDelivery = value <= 0.1;
  if (isSampleDelivery) {
    return "Sample Delivery";
  }

  const isExpressDelivery = value >= 249;

  if (findPostcodeBand(A, postcode)) {
    console.log(JSON.stringify("Band: A"));
    return isExpressDelivery ? "Standard AA" : "Standard A";
  }

  if (findPostcodeBand(B, postcode)) {
    console.log(JSON.stringify("Band: B"));
    return isExpressDelivery ? "Standard BB" : "Standard B";
  }

  if (findPostcodeBand(C, postcode)) {
    console.log(JSON.stringify("Band: C"));
    return isExpressDelivery ? "Standard CC" : "Standard C";
  }

  if (findPostcodeBand(D, postcode)) {
    console.log(JSON.stringify("Band: D"));
    return isExpressDelivery ? "Standard DD" : "Standard D";
  }

  console.log(JSON.stringify("Band: Default"));
  return isExpressDelivery ? "Free Shipping" : "Standard";
}

export function run(input: RunInput): FunctionRunResult {
  let total = input.cart.cost.totalAmount.amount;
  const postcodes = input.cart.deliveryGroups
    .map((group) => group?.deliveryAddress?.zip)
    .join("");

  // flat map options
  console.log("@deliveryGroups");
  const deliveryGroups = input.cart.deliveryGroups.flatMap((group) =>
    group.deliveryOptions.map((option) => option)
  );

  // total amount of cart value
  // binary search function to find shipping option based on postcode & cart value.
  console.log("@Method");
  let method = validatePostcode(postcodes, Number(total));

  /**
   * Operation method that hides ALL shipping methods apart from the associated one
   * to the users inputed POSTCODE.
   */
  console.log("@Hide");

  const toHide = deliveryGroups
    .filter((option) => option.title !== method)
    .map((option) => {
      return {
        hide: {
          deliveryOptionHandle: option.handle,
        },
      };
    });

  console.log("@Rename");
  // Operation to rename selected option to human readable format.
  const toRename = deliveryGroups
    .filter((option) => option.title == method)
    .map((option) => {
      return {
        rename: {
          deliveryOptionHandle: option.handle,
          title: "Standard",
        },
      };
    });

  return { operations: [...toHide, ...toRename] };
}
