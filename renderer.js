

document.getElementById('open-file-button').addEventListener('click', function (e) {
    console.log("click", window)
    window.electronAPI.sendCreateEditorWindow();
});