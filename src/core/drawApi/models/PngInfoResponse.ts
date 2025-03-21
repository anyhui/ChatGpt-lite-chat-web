/* tslint:disable */
/* eslint-disable */
/**
 * sdapiv1
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * PNGInfoResponse
 * @export
 * @interface PngInfoResponse
 */
export interface PngInfoResponse {
    /**
     * Image info，A string with the parameters used to generate the image
     * @type {string}
     * @memberof PngInfoResponse
     */
    info: string;
    /**
     * Items，A dictionary containing all the other fields the image had
     * @type {object}
     * @memberof PngInfoResponse
     */
    items: object;
    /**
     * Parameters，A dictionary with parsed generation info fields
     * @type {object}
     * @memberof PngInfoResponse
     */
    parameters: object;
}

export function PngInfoResponseFromJSON(json: any): PngInfoResponse {
    return PngInfoResponseFromJSONTyped(json, false);
}

export function PngInfoResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PngInfoResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'info': json['info'],
        'items': json['items'],
        'parameters': json['parameters'],
    };
}

export function PngInfoResponseToJSON(value?: PngInfoResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'info': value.info,
        'items': value.items,
        'parameters': value.parameters,
    };
}


