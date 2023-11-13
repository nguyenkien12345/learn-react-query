export interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: string
  country: string
  avatar: string
  btc_address: string
}

// Pick được sử dụng để chọn một số thuộc tính cụ thể từ một type hay interface có sẵn.
// Chọn ra những thuộc tính 'id', 'email', 'avatar', và 'last_name' từ  interface Student để tạo ra type Students.
export type Students = Pick<Student, 'id' | 'email' | 'avatar' | 'last_name'>[]
