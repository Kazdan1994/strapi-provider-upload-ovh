# @strapi/provider-upload-ovh

## Resources

- [LICENSE](LICENSE)

## Links

- [Strapi website](https://strapi.io/)
- [Strapi documentation](https://docs.strapi.io)
- [Strapi community on Discord](https://discord.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)

## Installation

```bash
# using yarn
yarn add @strapi/provider-upload-ovh

# using npm
npm install @strapi/provider-upload-ovh --save
```

### Provider Configuration

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'ovh',
      providerOptions: {
        keystoneAuthVersion: 'v3',
        provider: 'openstack',
        username: env('STORAGE_USERNAME'),
        password: env('STORAGE_PASSWORD'),
        region: env('STORAGE_REGION', 'GRA'),
        domainId: env('STORAGE_DOMAIN_ID', 'default'),
        domainName: env('STORAGE_TENANT_NAME', 'tenant_name'),
        authUrl: env('STORAGE_AUTH_URL', 'https://auth.cloud.ovh.net/'),
        defaultContainerName: env('STORAGE_CONTAINER_NAME'),
        publicUrlPrefix: env('STORAGE_PUBLIC_URL_PREFIX')
      }
    },
  },
  // ...
});
```


### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://auth.cloud.ovh.net'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://auth.cloud.ovh.net'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```
