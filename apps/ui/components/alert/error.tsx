import { Alert, AlertDescription } from '@/components/ui/alert'
import { IErrorMessage } from '@workspace/utils'
import { AlertCircle } from 'lucide-react'
import { FC } from 'react'

type Props = {
  message?: string
  errors?: IErrorMessage[]
}

export const AlertError: FC<Props> = ({ message, errors }) => {
  return (
    <Alert variant="destructive" className="border-red-500">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message && <span>{message}</span>}
        {errors &&
          errors?.map((error: IErrorMessage, index) => <span key={index}>{error.message}</span>)}
      </AlertDescription>
    </Alert>
  )
}
