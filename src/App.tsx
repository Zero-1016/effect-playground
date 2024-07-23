import './App.css'
import {useState} from "react";

type ImageSize = { width: number, height: number }
type FileStatus = { _tag: 'Not Selected' } | { _tag: 'Not Image' } | { _tag: 'File Error' } | {
    _tag: 'Selected',
    src: string,
    size: ImageSize
}

function App() {
    const [status, setStatus] = useState<FileStatus>({_tag: 'Not Selected'})

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file === undefined) {
            return setStatus({_tag: 'Not Selected'})
        }

        const reader = new FileReader()

        reader.onload = () => {
            const image = new Image()
            image.onload = () => {
                setStatus({
                    _tag: 'Selected',
                    size: {width: image.width, height: image.height},
                    src: reader.result as string
                })
            }
            image.onerror = () => {
                setStatus({_tag: 'Not Image'})
            }
            image.src = reader.result as string
        }
        reader.onerror = () => {
            setStatus({_tag: 'File Error'})
        }

        reader.readAsDataURL(file)
    }

    return (
        <>
            <h1>Vite + React</h1>
            <div className="card">
                <p>
                    {status._tag === 'Not Selected' && 'Please select a file'}
                    {status._tag === 'Not Image' && 'Please select an image'}
                    {status._tag === 'File Error' && 'File loading error'}
                    {status._tag === 'Selected' && `Image size: ${status.size.width}x${status.size.height} px`}
                </p>
                {status._tag === 'Selected' &&  <img alt='불러온 이미지' src={status.src}  width={Math.min(status.size.width, 400)} height={Math.min(500,status.size.height)}/>}
            </div>
            <input type='file' onChange={handleImageChange} multiple={false}/>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
