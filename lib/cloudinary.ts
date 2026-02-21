/**
 * Cloudinary unsigned upload helper.
 *
 * Set your Cloudinary cloud name in .env.local:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *
 * Create an unsigned upload preset in Cloudinary dashboard:
 *   Settings → Upload → Upload presets → Add preset → Set signing mode to "Unsigned"
 *   Name it: college_crush_upload
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME'
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'college_crush_upload'

export async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', 'college_crush/profiles')

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    )

    if (!res.ok) {
        const err = await res.json()
        const detail = err.error?.message || JSON.stringify(err)
        throw new Error(`Cloudinary error [cloud="${CLOUD_NAME}", preset="${UPLOAD_PRESET}"]: ${detail}`)
    }

    const data = await res.json()
    return data.secure_url as string
}
