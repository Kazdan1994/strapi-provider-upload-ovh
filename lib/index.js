const pkgcloud = require('pkgcloud');
const streamifier = require('streamifier');

module.exports = {

  init(providerOptions) {
    const client = pkgcloud.storage.createClient(providerOptions);
    const options = { container: providerOptions.defaultContainerName };

    const remoteURL = () =>
        new Promise((resolve, reject) => {
          return client.getContainer(providerOptions.defaultContainerName, (err, res) => {
            if (err && !res) return reject(err);
            return resolve(res);
          });
        });

    function stream2buffer(stream) {
      return new Promise((resolve, reject) => {
        const buffer = [];

        stream.on('data', (chunk) => buffer.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(buffer)));
        stream.on('error', (err) => reject(err));
      });
    }

    //returning an object with two methods defined
    return {

      upload(file) {
        const readStream = streamifier.createReadStream(file.buffer);
        const writeStream = client.upload({
          ...options,
          remote: file.hash,
          contentType: file.mime,
        });

        return new Promise((resolve, reject) => {

          readStream.pipe(writeStream);
          writeStream.on('error', error => error && reject(error));

          writeStream.on('success', result => {
            remoteURL()
                .then(() => {
                  resolve(
                      Object.assign(file, {
                        mime: result.contentType,
                        url: `${providerOptions.publicUrlPrefix}/${result.name}`,
                      })
                  );
                })
                .catch(err => console.error(err) && reject(err));
          });
        });
      },

      async uploadStream(file) {
        file.buffer = await stream2buffer(file.stream);

        return this.upload(file);
      },

      delete(file) {
        return new Promise((resolve, reject) => {
          client.removeFile(providerOptions.defaultContainerName, file.hash, error => {
            if (error) return reject(error);
            return resolve();
          });
        });
      }
    };
  },
};
