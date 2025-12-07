"use client";

const renderPaginationControls = ({ currentPage, totalPages, paginate }) => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxPagesToShow = 5; 
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <nav className="flex justify-center items-center my-8 space-x-2">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`cursor-pointer px-4 py-2 border rounded-lg transition duration-300 ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-500 hover:bg-blue-500 hover:text-white border-blue-500'}`}
                >
                    Anterior
                </button>
                
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`cursor-pointer px-4 py-2 border rounded-lg font-semibold transition duration-300 ${number === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-500 hover:bg-blue-100 border-gray-300'}`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`cursor-pointer px-4 py-2 border rounded-lg transition duration-300 ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-500 hover:bg-blue-500 hover:text-white border-blue-500'}`}
                >
                    Próxima
                </button>
            </nav>
        );
};

export default renderPaginationControls;