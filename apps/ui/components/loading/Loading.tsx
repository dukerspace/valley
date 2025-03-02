import { Loader2 } from 'lucide-react'

export const Loader = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader2 className="animate-spin" size={50} />
    </div>
  )
}
