export function checkTypeFile(file: any) {
    let countImageDone = 0
    file.map(image => {
        const type = image.originalname.split('.')[1] 
        if(type === 'jpg' || type === 'png' || type === 'jpeg') {
            countImageDone = countImageDone + 1
        }
    })
    return countImageDone
}
//Se o usuario mandar uma imagem no qual o nome tenha um . antes do type da imagem, vai dar pal, arrumar depois isso