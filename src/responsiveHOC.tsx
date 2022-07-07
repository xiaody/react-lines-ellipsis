import * as React from "react";
import debounce from "lodash-es/debounce";
import type { DebounceSettings, DebouncedFunc } from "lodash-es";

const isBrowser = typeof window !== "undefined";

type PropsOf<C> = C extends React.ComponentType<infer P> ? P : never;

export default function responsiveHOC(
  wait = 150,
  debounceOptions: DebounceSettings = {}
) {
  return function <C extends React.ComponentClass<any>>(
    Component: C
  ): React.ComponentClass<
    PropsOf<C> & { innerRef: (el: InstanceType<C>) => void }
  > {
    class Responsive extends React.Component<
      PropsOf<C> & { innerRef: (el: InstanceType<C>) => void },
      { winWidth: number }
    > {
      static displayName = `Responsive(${
        Component.displayName || Component.name
      })`;

      private readonly onResize: DebouncedFunc<typeof this.onResizeInner>;

      constructor(props: any) {
        super(props);
        this.state = {
          winWidth: isBrowser ? window.innerWidth : 0,
        };
        this.onResize = debounce(
          this.onResizeInner.bind(this),
          wait,
          debounceOptions
        );
      }

      componentDidMount() {
        window.addEventListener("resize", this.onResize);
      }

      componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
        this.onResize.cancel();
      }

      onResizeInner() {
        this.setState({
          winWidth: window.innerWidth,
        });
      }

      render() {
        const { innerRef, ...rest } = this.props;
        const C = Component as any;
        return <C ref={innerRef} {...rest} {...this.state} />;
      }
    }

    return Responsive;
  };
}
