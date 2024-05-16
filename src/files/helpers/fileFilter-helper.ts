
export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if ( !file ) return callback( new Error('Nfile is empty'), false )

    const fileExtensions = file.mimetype.split('/')[1];
    const validExtensions = [ 'jpg', 'jpeg', 'png', 'gif' ]

    if( validExtensions.includes( fileExtensions ) ) {
        return callback( null, true, )
    }
    
    return callback( null, false )
}