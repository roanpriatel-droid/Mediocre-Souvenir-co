/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  parentRelationship?: StorefrontAPI.Maybe<{
    parent: Pick<StorefrontAPI.CartLine, 'id'>;
  }>;
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  lineComponents: Array<
    Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
      attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
      cost: {
        totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        amountPerQuantity: Pick<
          StorefrontAPI.MoneyV2,
          'currencyCode' | 'amount'
        >;
        compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
      };
      merchandise: Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'requiresShipping' | 'title'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        product: Pick<
          StorefrontAPI.Product,
          'handle' | 'title' | 'id' | 'vendor'
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      };
      parentRelationship?: StorefrontAPI.Maybe<{
        parent: Pick<StorefrontAPI.CartLine, 'id'>;
      }>;
    }
  >;
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          parentRelationship?: StorefrontAPI.Maybe<{
            parent: Pick<StorefrontAPI.CartLine, 'id'>;
          }>;
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          lineComponents: Array<
            Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
              attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
              cost: {
                totalAmount: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                amountPerQuantity: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
              };
              merchandise: Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'availableForSale' | 'requiresShipping' | 'title'
              > & {
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                product: Pick<
                  StorefrontAPI.Product,
                  'handle' | 'title' | 'id' | 'vendor'
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              };
              parentRelationship?: StorefrontAPI.Maybe<{
                parent: Pick<StorefrontAPI.CartLine, 'id'>;
              }>;
            }
          >;
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type SouvenirProductIndexQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
  after?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type SouvenirProductIndexQuery = {
  products: {
    nodes: Array<Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>>;
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage' | 'endCursor'>;
  };
};

export type SouvenirCardsByIdsQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type SouvenirCardsByIdsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
          >;
        };
      }
    >
  >;
};

export type SouvenirNewestProductsQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirNewestProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
          >;
        };
      }
    >;
  };
};

export type SouvenirMoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type SouvenirCardFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  compareAtPriceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>>;
  };
};

export type SouvenirCollectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirCollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            variants: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
              >;
            };
          }
        >;
      };
    }
  >;
};

export type SouvenirCollectionPageQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductCollectionSortKeys>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
}>;

export type SouvenirCollectionPageQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            variants: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
              >;
            };
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
        >;
      };
    }
  >;
};

export type SouvenirCollectionNeutralQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirCollectionNeutralQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
          > & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            compareAtPriceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            variants: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
              >;
            };
          }
        >;
      };
    }
  >;
};

export type SouvenirCollectionsStatusQueryVariables = StorefrontAPI.Exact<{
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirCollectionsStatusQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'> & {
        products: {nodes: Array<Pick<StorefrontAPI.Product, 'id'>>};
      }
    >;
  };
};

export type SouvenirProductMoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type SouvenirProductImageFragment = Pick<
  StorefrontAPI.Image,
  'id' | 'url' | 'altText' | 'width' | 'height'
>;

export type SouvenirProductQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type SouvenirProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'handle' | 'title' | 'description' | 'vendor' | 'availableForSale'
    > & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
        }
      >;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale' | 'quantityAvailable'
          > & {
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
          }
        >;
      };
      collections: {
        nodes: Array<Pick<StorefrontAPI.Collection, 'handle' | 'title'>>;
      };
      ratingValue?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      ratingCount?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
    }
  >;
};

export type SearchMoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type SearchCardFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  compareAtPriceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>>;
  };
};

export type SouvenirSearchQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirSearchQuery = {
  search: Pick<StorefrontAPI.SearchResultItemConnection, 'totalCount'> & {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
          >;
        };
      }
    >;
  };
};

export type SouvenirSearchNeutralQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirSearchNeutralQuery = {
  search: Pick<StorefrontAPI.SearchResultItemConnection, 'totalCount'> & {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
          >;
        };
      }
    >;
  };
};

export type SouvenirProductsByHandleQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  first: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirProductsByHandleQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'handle' | 'title' | 'availableForSale' | 'tags'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        compareAtPriceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'>
          >;
        };
      }
    >;
  };
};

export type SouvenirPredictiveQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
  limit: StorefrontAPI.Scalars['Int']['input'];
}>;

export type SouvenirPredictiveQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    products: Array<
      Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
      }
    >;
  }>;
};

export type StorefrontDiagnosticQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StorefrontDiagnosticQuery = {
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  };
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'handle' | 'title'> & {
        products: {
          nodes: Array<
            Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
              featuredImage?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Image, 'url'>
              >;
              variants: {
                nodes: Array<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'availableForSale'
                  > & {
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                  }
                >;
              };
            }
          >;
        };
      }
    >;
  };
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }
    >;
  };
};

export type StorefrontDiagnosticNeutralQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type StorefrontDiagnosticNeutralQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'handle'> & {
        products: {nodes: Array<Pick<StorefrontAPI.Product, 'handle'>>};
      }
    >;
  };
  products: {nodes: Array<Pick<StorefrontAPI.Product, 'handle'>>};
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'handle' | 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PolicyQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PolicyQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  query Footer(\n    $country: CountryCode\n    $footerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n  query SouvenirProductIndex($first: Int!, $after: String) {\n    products(first: $first, after: $after, sortKey: TITLE) {\n      nodes {\n        id\n        handle\n        title\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n': {
    return: SouvenirProductIndexQuery;
    variables: SouvenirProductIndexQueryVariables;
  };
  '#graphql\n  query SouvenirCardsByIds($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on Product {\n        ...SouvenirCard\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n      maxVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    # Two is enough to answer "is this a one-variant product?" — which decides\n    # whether quick-add can add it outright or has to send you to the PDP.\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n\n': {
    return: SouvenirCardsByIdsQuery;
    variables: SouvenirCardsByIdsQueryVariables;
  };
  '#graphql\n  query SouvenirNewestProducts($first: Int!) {\n    products(first: $first, sortKey: CREATED_AT, reverse: true) {\n      nodes {\n        ...SouvenirCard\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n      maxVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    # Two is enough to answer "is this a one-variant product?" — which decides\n    # whether quick-add can add it outright or has to send you to the PDP.\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n\n': {
    return: SouvenirNewestProductsQuery;
    variables: SouvenirNewestProductsQueryVariables;
  };
  '#graphql\n  query SouvenirCollection($handle: String!, $first: Int!) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      image {\n        url\n        altText\n        width\n        height\n      }\n      products(first: $first) {\n        nodes {\n          ...SouvenirCard\n        }\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n      maxVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    # Two is enough to answer "is this a one-variant product?" — which decides\n    # whether quick-add can add it outright or has to send you to the PDP.\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n\n': {
    return: SouvenirCollectionQuery;
    variables: SouvenirCollectionQueryVariables;
  };
  '#graphql\n  query SouvenirCollectionPage(\n    $handle: String!\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n    $filters: [ProductFilter!]\n  ) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      image {\n        url\n        altText\n        width\n        height\n      }\n      products(\n        first: $first\n        last: $last\n        before: $startCursor\n        after: $endCursor\n        sortKey: $sortKey\n        reverse: $reverse\n        filters: $filters\n      ) {\n        nodes {\n          ...SouvenirCard\n        }\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          startCursor\n          endCursor\n        }\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n      maxVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    # Two is enough to answer "is this a one-variant product?" — which decides\n    # whether quick-add can add it outright or has to send you to the PDP.\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n\n': {
    return: SouvenirCollectionPageQuery;
    variables: SouvenirCollectionPageQueryVariables;
  };
  '#graphql\n  query SouvenirCollectionNeutral($handle: String!, $first: Int!) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      image {\n        url\n        altText\n        width\n        height\n      }\n      products(first: $first) {\n        nodes {\n          ...SouvenirCard\n        }\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n      maxVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SouvenirMoney\n      }\n    }\n    # Two is enough to answer "is this a one-variant product?" — which decides\n    # whether quick-add can add it outright or has to send you to the PDP.\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n  #graphql\n  fragment SouvenirMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n\n\n': {
    return: SouvenirCollectionNeutralQuery;
    variables: SouvenirCollectionNeutralQueryVariables;
  };
  '#graphql\n  query SouvenirCollectionsStatus($first: Int!) {\n    collections(first: $first) {\n      nodes {\n        id\n        handle\n        title\n        products(first: 1) {\n          nodes {\n            id\n          }\n        }\n      }\n    }\n  }\n': {
    return: SouvenirCollectionsStatusQuery;
    variables: SouvenirCollectionsStatusQueryVariables;
  };
  '#graphql\n  fragment SouvenirProductMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment SouvenirProductImage on Image {\n    id\n    url\n    altText\n    width\n    height\n  }\n  query SouvenirProduct($handle: String!) {\n    product(handle: $handle) {\n      id\n      handle\n      title\n      description\n      vendor\n      availableForSale\n      featuredImage {\n        ...SouvenirProductImage\n      }\n      images(first: 8) {\n        nodes {\n          ...SouvenirProductImage\n        }\n      }\n      options {\n        name\n        optionValues {\n          name\n        }\n      }\n      priceRange {\n        minVariantPrice {\n          ...SouvenirProductMoney\n        }\n        maxVariantPrice {\n          ...SouvenirProductMoney\n        }\n      }\n      variants(first: 100) {\n        nodes {\n          id\n          title\n          availableForSale\n          quantityAvailable\n          price {\n            ...SouvenirProductMoney\n          }\n          compareAtPrice {\n            ...SouvenirProductMoney\n          }\n          selectedOptions {\n            name\n            value\n          }\n          image {\n            ...SouvenirProductImage\n          }\n        }\n      }\n      collections(first: 20) {\n        nodes {\n          handle\n          title\n        }\n      }\n      # Review aggregates, as written by Judge.me / Okendo / Loox / Yotpo.\n      # Absent until a reviews app is installed, which is the point: the\n      # markup below only ever describes ratings that actually exist.\n      ratingValue: metafield(namespace: "reviews", key: "rating") {\n        value\n      }\n      ratingCount: metafield(namespace: "reviews", key: "rating_count") {\n        value\n      }\n      seo {\n        title\n        description\n      }\n    }\n  }\n': {
    return: SouvenirProductQuery;
    variables: SouvenirProductQueryVariables;
  };
  '#graphql\n  query SouvenirSearch($query: String!, $first: Int!) {\n    search(query: $query, first: $first, types: PRODUCT) {\n      totalCount\n      nodes {\n        ...on Product {\n          ...SearchCard\n        }\n      }\n    }\n  }\n  #graphql\n  fragment SearchMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment SearchCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SearchMoney\n      }\n      maxVariantPrice {\n        ...SearchMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SearchMoney\n      }\n    }\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n\n': {
    return: SouvenirSearchQuery;
    variables: SouvenirSearchQueryVariables;
  };
  '#graphql\n  query SouvenirSearchNeutral($query: String!, $first: Int!) {\n    search(query: $query, first: $first, types: PRODUCT) {\n      totalCount\n      nodes {\n        ...on Product {\n          ...SearchCard\n        }\n      }\n    }\n  }\n  #graphql\n  fragment SearchMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment SearchCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SearchMoney\n      }\n      maxVariantPrice {\n        ...SearchMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SearchMoney\n      }\n    }\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n\n': {
    return: SouvenirSearchNeutralQuery;
    variables: SouvenirSearchNeutralQueryVariables;
  };
  '#graphql\n  query SouvenirProductsByHandle($query: String!, $first: Int!) {\n    products(first: $first, query: $query) {\n      nodes {\n        ...SearchCard\n      }\n    }\n  }\n  #graphql\n  fragment SearchMoney on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment SearchCard on Product {\n    id\n    handle\n    title\n    availableForSale\n    tags\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...SearchMoney\n      }\n      maxVariantPrice {\n        ...SearchMoney\n      }\n    }\n    compareAtPriceRange {\n      minVariantPrice {\n        ...SearchMoney\n      }\n    }\n    variants(first: 2) {\n      nodes {\n        id\n        availableForSale\n      }\n    }\n  }\n\n': {
    return: SouvenirProductsByHandleQuery;
    variables: SouvenirProductsByHandleQueryVariables;
  };
  '#graphql\n  query SouvenirPredictive($query: String!, $limit: Int!) {\n    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT]) {\n      products {\n        id\n        handle\n        title\n        featuredImage {\n          url\n          altText\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n  }\n': {
    return: SouvenirPredictiveQuery;
    variables: SouvenirPredictiveQueryVariables;
  };
  '#graphql\n  query StorefrontDiagnostic($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      name\n      primaryDomain {\n        url\n      }\n    }\n    collections(first: 250) {\n      nodes {\n        handle\n        title\n        products(first: 3) {\n          nodes {\n            handle\n            title\n            featuredImage {\n              url\n            }\n            variants(first: 1) {\n              nodes {\n                id\n                availableForSale\n                price {\n                  amount\n                  currencyCode\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    products(first: 5) {\n      nodes {\n        handle\n        title\n        featuredImage {\n          url\n        }\n      }\n    }\n  }\n': {
    return: StorefrontDiagnosticQuery;
    variables: StorefrontDiagnosticQueryVariables;
  };
  '#graphql\n  query StorefrontDiagnosticNeutral {\n    collections(first: 250) {\n      nodes {\n        handle\n        products(first: 1) {\n          nodes {\n            handle\n          }\n        }\n      }\n    }\n    products(first: 5) {\n      nodes {\n        handle\n      }\n    }\n  }\n': {
    return: StorefrontDiagnosticNeutralQuery;
    variables: StorefrontDiagnosticNeutralQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  )\n  @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      handle\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment Policy on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n  query Policy(\n    $country: CountryCode\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $refundPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...Policy\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...Policy\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...Policy\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...Policy\n      }\n    }\n  }\n': {
    return: PolicyQuery;
    variables: PolicyQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
