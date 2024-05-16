import { DataSource, QueryRunnerAlreadyReleasedError, Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto, UpdateProductDto } from './dto';
import { Product, ProductImage } from './entities';
import { waitForDebugger } from 'inspector';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsServicre')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSoucre: DataSource
  ) {}

  async create(createProductDto: CreateProductDto) {
    
    try {
      const { images = [], ...productDetails } = createProductDto      
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImagesRepository.create({ url: image }) )
      });

      await this.productRepository.save( product )

      return { ...product, images }
    } catch (error) {
      this.handleDbExceptions( error )
    }

  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit= 10, offset= 0 } = paginationDto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map( product => ({
      ...product,
      images: product.images.map( img => img.url )
    }))
  }

  async findOne(ref: string) {
    let product: Product;

    if ( isUUID( ref )) {
      product = await this.productRepository.findOneBy({ id: ref });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where('LOWER(title) =:title or slug =:slug', {
          'title': ref.toLocaleLowerCase(),
          'slug': ref.toLocaleLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if ( !product )
      throw new NotFoundException(`Product with ref ${ ref } not found.`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found.`);

    const queryRunner = this.dataSoucre.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      
      if( images ) {
        await queryRunner.manager.delete(
          ProductImage,
          {
            product: { id: id}
          }
        )

        product.images = images.map(
          image => this.productImagesRepository.create({ url: image })
        );

      }

      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      
      this.handleDbExceptions( error )
    }
    
  }

  async remove(id: string) {
    const product = await this.findOne( id );

    await this.productRepository.remove( product );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDbExceptions( error );
    }
  }

  private handleDbExceptions( error: any ): never {
    if( error.code === '23505' )
      throw new BadRequestException( error.detail )

    throw new InternalServerErrorException('Server Error')
  }
}
