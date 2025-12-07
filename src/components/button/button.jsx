const Button = ({content, colorClass, ...props}) => {

  return (
    <button
      {...props}
      type="submit"
    >
     {content}
    </button>
  )
}

export default Button;