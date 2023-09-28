export function checkTypeFileImage(file: any) {
    let countImageDone = 0
    file.map(image => {
        const type = image.originalname.split('.')[1] 
        if(type === 'jpg' || type === 'png' || type === 'jpeg') {
            countImageDone = countImageDone + 1
        }
    })
    return countImageDone
}

export function checkTypeFileVideo(file: any) {
    let countVideoDone = 0

    const type = file[0].originalname.split('.')[1]

    if(type === 'mp3' || type === 'mp4' || type === 'WEBM' || type === 'MOV') {
        countVideoDone = countVideoDone + 1
    }

    return countVideoDone
}
//Se o usuario mandar uma imagem no qual o nome tenha um . antes do type da imagem, vai dar pal, arrumar depois isso