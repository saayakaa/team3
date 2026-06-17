const imageInput = document.getElementById("imageInput");
const oshiImage = document.getElementById("oshiImage");

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    const imageUrl = URL.createObjectURL(file);

    oshiImage.src = imageUrl;
});
