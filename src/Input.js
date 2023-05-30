import { View } from "@ulibs/components";

export function Input($props, slots) {
  const { value, component = "input", ref, type, label, ...restProps } = $props;

  const props = {
    ...restProps,
    component,
    ref,
    onMount($el) {
      console.log("onMount input", $refs, $el);
      $refs[$el.getAttribute("ref")] = $el;
    },
    tag: "input",
  };

  if (!value) {
    if (type === "number") {
      props.value = 0;
    } else {
      props.value = "";
    }
  } else {
    props.value = value;
  }

  return View({ component: component + "-wrapper" }, [
    label &&
      View(
        {
          tag: "label",
          component: "label",
        },
        label
      ),
    View(props, slots),
  ]);
}

export function Icon({ name, size }) {
  return View({
    tag: "span",
    onMount($el, props) {
      fetch(`https://unpkg.com/@tabler/icons@2.19.0/icons/${props}.svg`)
        .then((res) => res.text())
        .then((svg) => {
          $el.outerHTML = svg.replace("icon icon-tabler", "u-icon");
        });
    },
    component: "icon",
    jsProps: name,
  });
}

export function Table($props, slots) {
  const { component = "table", tag = "table", ...restProps } = $props;

  const props = {
    ...restProps,
    component: component + "-wrapper",
  };

  return View(props, [View({ tag, component }, slots)]);
}

export function TableHead($props, slots) {
  const { component = "table-head", tag = "thead", ...restProps } = $props;

  const props = {
    ...restProps,
    tag,
    component,
  };

  return View(props, slots);
}
export function TableBody($props, slots) {
  const { component = "table-body", tag = "tbody", ...restProps } = $props;

  const props = {
    ...restProps,
    tag,
    component,
  };

  return View(props, slots);
}

export function TableCell($props, slots) {
  const {
    component = "table-cell",
    head,
    tag = head ? "th" : "td",
    ...restProps
  } = $props;

  const props = {
    ...restProps,
    tag,
    component,
  };

  return View(props, slots);
}

export function TableFoot($props, slots) {
  const { component = "table-foot", tag = "tfoot", ...restProps } = $props;

  const props = {
    ...restProps,
    tag,
    component,
  };

  return View(props, slots);
}

export function TableRow($props, slots) {
  const { component = "table-row", tag = "tr", ...restProps } = $props;

  const props = {
    ...restProps,
    tag,
    component,
  };

  return View(props, slots);
}

export function Modal($props, slots) {
  const {
    component = "modal",
    open = false,
    persistent,
    ...restProps
  } = $props;

  function close($el) {
    $el.classList.remove("u-modal-open");
  }

  const props = {
    ...restProps,
    component,
    cssProps: { open },
    jsProps: { open, persistent },
    onMount($el, $props) {
      const props = JSON.parse($props);

      if (props.open) {
        $el.classList.add("u-modal-open");
      }

      // close modal
      $el.querySelector(".u-modal-backdrop").addEventListener("click", () => {
        console.log(props);
        if (props.persistent) return;
        $el.classList.remove("u-modal-open");
      });
    },
  };

  return View(props, [
    View({ component: component + "-backdrop" }),
    View({ component: component + "-content" }, slots),
  ]);
}

export function ModalBody($props, slots) {
  const { component = "modal-body", ...restProps } = $props;

  const props = {
    ...restProps,
    component,
  };
  return View(props, slots);
}
