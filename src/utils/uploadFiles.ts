import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { getToken } from 'src/utils/get-token';

function hashNameFolder(idUserLength: number) {
    const dateNow = new Date(Date.now()).toString()
    const imageDate = dateNow.split(' ')
    const imageCreatedDate = {
        year: imageDate[3],
        month: imageDate[1],
        day: imageDate[2],
    }

    let randomNUmber = Math.random() * 3
    randomNUmber = parseInt(randomNUmber.toString().split('.')[1])

    const hashName = (dateNow.length * idUserLength) * randomNUmber
    const nameFile = hashName.toString() + `-${imageCreatedDate.year}-${imageCreatedDate.month}-${imageCreatedDate.day}`

    return nameFile
}

export function uploadFiles(file: any, req: any, action: string) {
    const informationUser = getToken(req)
    const folder = fs.readdirSync('./src/public/images/')
    let folderUser = null
    let folderAction = null
    let arrayNameFiles = []

    folder.map(foldeName => {
        if (foldeName == informationUser.id) {
            folderUser = foldeName
            const folderActionName = fs.readdirSync(`./src/public/images/${foldeName}`)

            folderActionName.map(actionFolder => {
                if(actionFolder == action) {
                    folderAction = action
                }
            })
        }
    })

    if (folderUser) {
        if(!folderAction) {
            fs.mkdirSync(`./src/public/images/${informationUser.id}/${action}`)
        }

        file.map(fileInformation => {
            const nameFile = hashNameFolder(informationUser.id.length)

            const buffer = Buffer.from(fileInformation.buffer)

            const formatFile = fileInformation.originalname.split('.')[1]

            fs.writeFile(`./src/public/images/${folderUser}/${action}/${nameFile}.${formatFile}`, buffer, (err) => {
                if (err) {
                    console.error('Erro ao escrever o arquivo:', err);
                }
            });

            arrayNameFiles.push(`${nameFile}.${formatFile}`)
        })
    } else {
        fs.mkdirSync(`./src/public/images/${informationUser.id}`)
        fs.mkdirSync(`./src/public/images/${informationUser.id}/${action}`)

        file.map(fileInformation => {
            const nameFile = hashNameFolder(informationUser.id.length)

            const buffer = Buffer.from(fileInformation.buffer)

            const formatFile = fileInformation.originalname.split('.')[1]

            fs.writeFile(`./src/public/images/${informationUser.id}/${action}/${nameFile}.${formatFile}`, buffer, (err) => {
                if (err) {
                    console.error('Erro ao escrever o arquivo:', err);
                }
            });

            arrayNameFiles.push(`${nameFile}.${formatFile}`)
        })
    }
    
    return arrayNameFiles
}