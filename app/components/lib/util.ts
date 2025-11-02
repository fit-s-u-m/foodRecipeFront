export async function uploadToCloudinary(files: File[]) {
  const cloudName = "dabbqob1j";
  const uploadPreset = "food-Recipe";

  const uploadPromises = Array.from(files).map(async (file): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; // return the uploaded URL
  });

  // Run all uploads in parallel
  const urls = await Promise.all(uploadPromises);

  // You now have all the uploaded image URLs
  // eslint-disable-next-line no-console
  console.log("Uploaded URLs:", urls);
  return urls;
}
