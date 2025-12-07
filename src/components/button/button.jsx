const Button = ({content, colorClass, ...props}) => {

  const bgColor = `bg-${colorClass}-600`;
  const hoverColor = `hover:bg-${colorClass}-700`;

  return (
    <button
      {...props}
      type="submit"
      //className={`w-full py-3 px-4 ${bgColor} text-white font-semibold rounded-lg shadow-md ${hoverColor} transition duration-200`}
    >
     {content}
    </button>
  )
}

export default Button;