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
 * ExtrasSingleImageResponse
 * @export
 * @interface ExtrasSingleImageResponse
 */
export interface ExtrasSingleImageResponse {
    /**
     * HTML info，A series of HTML tags containing the process info.
     * @type {string}
     * @memberof ExtrasSingleImageResponse
     */
    htmlInfo: string;
    /**
     * Image，The generated image in base64 format.
     * @type {string}
     * @memberof ExtrasSingleImageResponse
     */
    image?: string;
}

export function ExtrasSingleImageResponseFromJSON(json: any): ExtrasSingleImageResponse {
    return ExtrasSingleImageResponseFromJSONTyped(json, false);
}

export function ExtrasSingleImageResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExtrasSingleImageResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'htmlInfo': json['html_info'],
        'image': !exists(json, 'image') ? undefined : json['image'],
    };
}

export function ExtrasSingleImageResponseToJSON(value?: ExtrasSingleImageResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'html_info': value.htmlInfo,
        'image': value.image,
    };
}


