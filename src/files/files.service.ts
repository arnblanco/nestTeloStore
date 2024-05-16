import { BadRequestException, Injectable } from '@nestjs/common'
import { existsSync } from 'fs'
import { join } from 'path'

@Injectable()
export class FilesService {

    getStaticProductImage( imageName: string ) {
        const path = join( __dirname, '../../statics/productos', imageName )

        if( existsSync(path) )
            throw new BadRequestException(`No producto found with iamge ${ imageName }`);

        return path;
    }

}
