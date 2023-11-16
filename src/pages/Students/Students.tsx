import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { useQueryString } from 'utils/utils'
import { deleteStudent, getStudent, getStudents } from 'apis/students.api'

export default function Students() {
  const LIMIT = 10
  // ++++++++++ Khi chưa sử dụng React Query ++++++++++
  // const [students, setStudents] = useState<Students>([])
  // const [isLoading, setIsLoading] = useState<boolean>(false)

  // useEffect(() => {
  //   setIsLoading(true)
  //   getStudents(1, 10)
  //     .then((res) => {
  //       setStudents(res.data)
  //     })
  //     .finally(() => {
  //       setIsLoading(false)
  //     })
  // }, [])
  // ++++++++++ Khi chưa sử dụng React Query ++++++++++

  const queryClient = useQueryClient() // Tham chiếu đến queryClient nằm trong src/index.tsx
  const queryString: { page?: string } = useQueryString()
  const page = Number(queryString.page) || 1

  const studentsQuery = useQuery({
    // Bản thân useQuery còn được gọi là query instance
    // queryKey: Nó là 1 cái key định danh cho cái query của chúng ta. React query sẽ quản lý cái việc query catching dựa trên cái
    // query keys của chúng ta. queryKey có thể là 1 simple array. Nó giống như là 1 dependency của useEffect vậy.
    // Cái query function của chúng ta hoàn toàn có thể bị phụ thuộc vào 1 cái biến nghĩa là khi cái biến đó thay đổi thì 
    // cái query function của chúng ta sẽ được trigger và chạy lại. Lúc đó chúng ta sẽ phải đặt cái biến đó vào trong queryKey
    // Vd: Mỗi khi mà cái page thay đổi thì cái query function của chúng ta sẽ được trigger và chạy lại
    // query function sẽ trả về 1 cái promise. Cái promise này có thể resolve the data hoặc throw an error
    // Vd: Khi chưa sử dụng keepPreviousData: Khi mà ta từ trang 1 chuyển qua trang 2 có nghĩa là data của trang 2 nó chưa có (Nó là undefined)
    // nên là khi qua trang 2 nó sẽ xuất hiện loading (Những trang mà chúng ta chưa load thì nó chưa có cache (nghĩa là data là undefined, loading là true))
    // Khi sử dụng keepPreviousData: Khi mà ta từ trang 1 chuyển qua trang 2 có nghĩa là data của trang 2 nó chưa có (Mặc dù data vẫn là undefined nhưng
    // lúc này loading sẽ là false (Nghĩa là nó vẫn giữ data trước đó) và khi mà nó fetch data thành công của trang số 2 thì nó mới
    // cập nhật lại data mới cho trang số 2. (Nó sẽ không xuất hiện loading) (Tăng trải nghiệm ux người dùng))

    queryKey: ['students', page],
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 5000)
      return getStudents(page, LIMIT, controller.signal)
    },
    // staleTime: 60 * 1000,
    // cacheTime: 5 * 1000,
    keepPreviousData: true,
    retry: 0
  })

  const totalStudentsCount = Number(studentsQuery.data?.headers['x-total-count'] || 0)
  const totalPage = Math.ceil(totalStudentsCount / LIMIT)

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number | string) => deleteStudent(id),
    // _: data trả về sau khi delete
    onSuccess: (_, id) => {
      toast.success(`Xóa thành công student với id là ${id}`)
      // queryClient.invalidateQueries: Mỗi lần mà mình delete thành công thì nó sẽ chạy lên studentsQuery thông qua queryKey: ['students', page]
      // và báo rằng data này đã cũ rồi đi cập nhật mới lại thôi. Lúc này query function trong studentsQuery sẽ được trigger và chạy lại api getStudents
      queryClient.invalidateQueries({ queryKey: ['students', page], exact: true })
    }
  })

  const handleDelete = (id: number) => {
    deleteStudentMutation.mutate(id)
  }

  const handlePrefetchStudent = (id: number) => {
    // Fetch api gọi trước thông qua queryKey: ['students', id],
    queryClient.prefetchQuery(['student', String(id)], {
      queryFn: () => getStudent(id),
      // Kiểm tra xem kết quả cũ mà được gọi trước đấy đã quá 10s hay chưa. Nếu chưa thì không chạy query function này
      staleTime: 10 * 1000
    })
  }

  const fetchStudent = (second: number) => {
    const id = '6'
    queryClient.prefetchQuery(['student', id], {
      queryFn: () => getStudent(id),
      staleTime: second * 1000
    })
  }

  const refetchStudents = () => {
    studentsQuery.refetch()
  }

  const cancelRequestStudents = () => {
    queryClient.cancelQueries({ queryKey: ['students', page] })
  }

  return (
    <div>
      <h1 className='text-lg'>Students</h1>
      <div>
        <button className='mt-6 rounded bg-blue-500 px-5 py-2 text-white' onClick={() => fetchStudent(10)}>
          Click 10s
        </button>
      </div>
      <div>
        <button className='mt-6 rounded bg-blue-500 px-5 py-2 text-white' onClick={() => fetchStudent(2)}>
          Click 2s
        </button>
      </div>
      <div>
        <button className='mt-6 rounded bg-pink-700 px-5 py-2 text-white' onClick={refetchStudents}>
          Refetch Students
        </button>
      </div>
      <div>
        <button className='mt-6 rounded bg-pink-700 px-5 py-2 text-white' onClick={cancelRequestStudents}>
          Cancel Request Students
        </button>
      </div>
      <div className='mt-6'>
        <Link
          to='/students/add'
          className='rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 '
        >
          Add Student
        </Link>
      </div>

      {studentsQuery.isLoading && (
        <div role='status' className='mt-6 animate-pulse'>
          <div className='mb-4 h-4  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10 rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <span className='sr-only'>Loading...</span>
        </div>
      )}
      {!studentsQuery.isLoading && (
        <Fragment>
          <div className='relative mt-6 overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-left text-sm text-gray-500 dark:text-gray-400'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='py-3 px-6'>
                    #
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Avatar
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Name
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Email
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    <span className='sr-only'>Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentsQuery.data?.data.map((student) => (
                  <tr
                    key={student.id}
                    className='border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600'
                    onMouseEnter={() => handlePrefetchStudent(student.id)}
                  >
                    <td className='py-4 px-6'>{student.id}</td>
                    <td className='py-4 px-6'>
                      <img src={student.avatar} alt='student' className='h-5 w-5' />
                    </td>
                    <th scope='row' className='whitespace-nowrap py-4 px-6 font-medium text-gray-900 dark:text-white'>
                      {student.last_name}
                    </th>
                    <td className='py-4 px-6'>{student.email}</td>
                    <td className='py-4 px-6 text-right'>
                      <Link
                        to={`/students/${student.id}`}
                        className='mr-5 font-medium text-blue-600 hover:underline dark:text-blue-500'
                      >
                        Edit
                      </Link>
                      <button
                        className='font-medium text-red-600 dark:text-red-500'
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-6 flex justify-center'>
            <nav aria-label='Page navigation example'>
              <ul className='inline-flex -space-x-px'>
                <li>
                  {page === 1 ? (
                    <span className='cursor-not-allowed rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 '>
                      Previous
                    </span>
                  ) : (
                    <Link
                      className='rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 '
                      to={`/students?page=${page - 1}`}
                    >
                      Previous
                    </Link>
                  )}
                </li>
                {/* Tạo một mảng với độ dài là totalPage, tức là một mảng có totalPage phần tử. */}
                {Array(totalPage)
                  .fill(0)
                  .map((_, index) => {
                    const pageNumber = index + 1
                    const isActive = page === pageNumber
                    return (
                      <li key={pageNumber}>
                        <Link
                          className={classNames(
                            'border border-gray-300 py-2 px-3 leading-tight hover:bg-gray-100 hover:text-gray-700 ',
                            {
                              'bg-gray-100 text-gray-700': isActive,
                              'bg-white text-gray-500': !isActive
                            }
                          )}
                          to={`/students?page=${pageNumber}`}
                        >
                          {pageNumber}
                        </Link>
                      </li>
                    )
                  })}
                <li>
                  {page === totalPage ? (
                    <span className='cursor-not-allowed rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 '>
                      Next
                    </span>
                  ) : (
                    <Link
                      className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 '
                      to={`/students?page=${page + 1}`}
                    >
                      Next
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </Fragment>
      )}
    </div>
  )
}
