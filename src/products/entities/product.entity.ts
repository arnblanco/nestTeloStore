import slugify from "slugify";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Product {

    @ApiProperty({
        example: '',
        description: 'Product Id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty()
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty()
    @Column('text', {
        nullable: true
    })
    description: string;

    @ApiProperty()
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty()
    @Column('int')
    stock: number;

    @ApiProperty()
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty()
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        ( productImage ) => productImage.product,
        {
            cascade: true,
            eager: true
        }
    )
    images?: ProductImage[];

    @BeforeInsert()
    checkSlugInsert() {
        if( !this.slug ) {
            this.slug = this.title
        }

        this.slug = slugify( this.slug )
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        if( !this.slug ) {
            this.slug = this.title
        }

        this.slug = slugify( this.slug )
    }
}
