const MetricCard = ({ icon: Icon, title, value, color }) => {
    return (
            <div className={`p-5 bg-white rounded-lg shadow-md border-l-4 border-${color}-500 transition hover:shadow-lg`}>
                <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <Icon className={`w-5 h-5 text-${color}-500`} />
                </div>
                <div className="mt-1 flex items-end justify-between">
                <p className="text-3xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
)};

export default MetricCard;