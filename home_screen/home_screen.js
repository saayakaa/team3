/*
//firebaseとの接続
initializeApp()
getFirestore()

// kadai1から取得
const q = query(
    collection(db, "kadai1"),
    orderBy("created", "desc")
);

// 未完了だけ取得
t.done === false
*/

//ユーザが選択した画像を表示する
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
