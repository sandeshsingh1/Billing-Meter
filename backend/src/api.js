const API = "http://localhost:5000/api/objects";

export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return res.json();
};

export const getFiles = async (token) => {
  const res = await fetch(`${API}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const deleteFile = async (fileName, token) => {
  await fetch(`${API}/${fileName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPresignedUrl = async (fileName, token) => {
  const res = await fetch(`${API}/presigned/${fileName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};