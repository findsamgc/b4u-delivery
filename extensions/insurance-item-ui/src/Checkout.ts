import {
  extension,
  Text,
  Icon,
  InlineStack,
  InlineSpacer,
} from "@shopify/ui-extensions/checkout";

export default extension(
  "purchase.checkout.cart-line-item.render-after",
  (root, api) => {
    // console.log("attr:", api.attributes.current);
    const isInsurance = JSON.parse(
      api?.attributes?.current?.find(({ key }) => key === "isInsurance")
        ?.value ?? ""
    );

    const insuranceLabel =
      api?.attributes?.current?.find(({ key }) => key === "insuranceLabel")
        ?.value ?? "Insurance";

    if (isInsurance === false) return;

    api.target.subscribe((updatedTarget) => {
      // Check if updatedTarget.cost is not 0
      if (updatedTarget.cost.totalAmount.amount !== 0) {
        const text = root.createComponent(
          Text,
          { size: "small", appearance: "success" },
          `${insuranceLabel}`
        );

        const space = root.createComponent(InlineSpacer, {
          spacing: "extraTight",
        });

        const icon = root.createComponent(Icon, {
          size: "extraSmall",
          appearance: "success",
          source: "checkmark",
        });

        const component = root.createComponent(
          InlineStack,
          {
            padding: ["extraTight", "tight", "tight", "none"],
            spacing: "none",
            inlineAlignment: "start",
            blockAlignment: "center",
          },
          [text, space, icon]
        );

        root.replaceChildren(component);
      } else {
        // Optionally, clear the existing message if cost is 0
        root.replaceChildren();
      }
    });
  }
);
