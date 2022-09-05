import * as React from "react"
import Svg, { Path } from "react-native-svg"

export const StarIcon = (props) => {
  return (
    <Svg
      width={props.width ? props.width : 22}
      viewBox="0 -10 511.987 511"
      height= {props.height ? props.height : 22 }
      {...props}
    >
      <Path
        d="M510.652 185.902a27.158 27.158 0 00-23.425-18.71l-147.774-13.419-58.433-136.77C276.71 6.98 266.898.494 255.996.494s-20.715 6.487-25.023 16.534l-58.434 136.746-147.797 13.418A27.208 27.208 0 001.34 185.902c-3.371 10.368-.258 21.739 7.957 28.907l111.7 97.96-32.938 145.09c-2.41 10.668 1.73 21.696 10.582 28.094 4.757 3.438 10.324 5.188 15.937 5.188 4.84 0 9.64-1.305 13.95-3.883l127.468-76.184 127.422 76.184c9.324 5.61 21.078 5.097 29.91-1.305a27.223 27.223 0 0010.582-28.094l-32.937-145.09 111.699-97.94a27.224 27.224 0 007.98-28.927zm0 0"
        fill="#ffc107"
      />
    </Svg>
  )
}

export const RightAngledIcon = (props) => {
  return (
    <Svg
          {...props}
     width= {props.width ? props.width : 22}
      height= {props.height ? props.height : 22 }
      viewBox="0 0 123.958 123.959"

    >
      <Path d="M38.217 1.779c-3.8-3.8-10.2-1.1-10.2 4.2v112c0 5.3 6.4 8 10.2 4.2l56-56c2.3-2.301 2.3-6.101 0-8.401l-56-55.999z" />
    </Svg>
  )
}
