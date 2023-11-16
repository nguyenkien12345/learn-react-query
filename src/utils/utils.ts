import axios, { AxiosError } from 'axios'
import { useSearchParams } from 'react-router-dom'

export const useQueryString = () => {
  const [searchParams] = useSearchParams()
  // Object.fromEntries nhận vào một mảng chứa các cặp key-value và chuyển đổi nó thành một đối tượng
  const searchParamsObject = Object.fromEntries([...searchParams])
  return searchParamsObject
}

// Kiểu dữ liệu trả về là boolean. error is AxiosError<T> Đây là một kiểu trả về của hàm. Nếu hàm trả về true, thì đối tượng được kiểm tra (error) sẽ có kiểu AxiosError<T>
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  // axios.isAxiosError kiểm tra xem đối tượng error có phải là một lỗi của Axios hay không.
  // Nếu đúng, hàm isAxiosError trả về true và kiểu trả về của hàm là AxiosError<T>. Nếu sai, hàm trả về false
  return axios.isAxiosError(error)
}
