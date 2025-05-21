$(document).ready(function () {
  loadAppNames();

  function loadAppNames() {
    fetch(`${window.baseUrl}${window.path}/config/appNames`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          data.forEach((appName) => {
            $('#appName').append(
              `<option value="${appName}">${appName}</option>`,
            );
          });
          loadConfigurations(); // Load initial configs
        } else {
          $('#appName').append(
            `<option value="" disabled>No applications found</option>`,
          );
          $('#configDisplay').html('<p>No applications found.</p>');
        }
      })
      .catch((error) => {
        console.error('Error loading app names:', error);
        $('#appName').append(
          `<option value="" disabled>Error loading applications</option>`,
        );
        $('#configDisplay').html(
          '<p class="text-danger">Error loading applications.</p>',
        );
      });
  }

  function loadConfigurations() {
    const appName = document.getElementById('appName').value;
    const environment = document.getElementById('environment').value;
    const lastUpdated = new Date(0).toISOString();

    if (appName) {
      fetch(
        `${window.baseUrl}${window.path}/config/${appName}/${environment}?lastUpdated=${lastUpdated}`,
      )
        .then((response) => {
          if (response.status === 404) {
            $('#configDisplay').html(
              `<p>No configurations found for ${appName} in ${environment} environment.</p>`,
            );
            return Promise.reject('404 Not Found');
          }
          return response.json();
        })
        .then((data) => {
          displayConfigurations(data.configs);
        })
        .catch((error) => {
          if (error !== '404 Not Found') {
            console.error('Error loading configurations:', error);
            $('#configDisplay').html(
              '<p class="text-danger">Error loading configurations.</p>',
            );
          }
        });
    }
  }

  function displayConfigurations(configs) {
    let html = '';
    const groupedConfigs = {};
    const environment = document.getElementById('environment').value;

    configs.forEach((config) => {
      if (!groupedConfigs[config.group]) {
        groupedConfigs[config.group] = [];
      }
      groupedConfigs[config.group].push(config);
    });

    for (const group in groupedConfigs) {
      let groupClass = '';
      if (environment === 'production') {
        groupClass = 'group-production';
      } else if (environment === 'demo') {
        groupClass = 'group-demo';
      } else if (environment === 'test') {
        groupClass = 'group-test';
      } else if (environment === 'development') {
        groupClass = 'group-development';
      }

      html += `<h3 class="${groupClass}">${group}</h3><div class="row">`;
      groupedConfigs[group].forEach((config) => {
        let buttonClass = 'btn-success';

        if (environment === 'production') {
          buttonClass = 'btn-danger';
        } else if (environment === 'demo') {
          buttonClass = 'btn-warning';
        } else if (environment === 'test') {
          buttonClass = 'btn-info';
        } else if (environment === 'development') {
          buttonClass = 'btn-primary';
        }

        html += `
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${config.key}</h5>
                <p class="card-text">
                  <label>Value:</label>
                  <input type="text" class="form-control" id="value-${config.key}" value="${config.value}">
                </p>
                <p class="card-text">
                  <small class="text-muted">${config.comment}</small>
                </p>
                <button class="btn btn-sm ${buttonClass} save-config" data-key="${config.key}" data-comment="${config.comment}" data-group="${config.group}">Save</button>
              </div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    $('#configDisplay').html(html);

    document.querySelectorAll('.save-config').forEach((button) => {
      button.addEventListener('click', function () {
        const key = this.dataset.key;
        const comment = this.dataset.comment;
        const group = this.dataset.group;
        const value = document.getElementById(`value-${key}`).value;
        saveConfig(key, comment, group, value);
      });
    });
  }

  function saveConfig(key, comment, group, value) {
    if (confirm('Are you sure you want to save this configuration?')) {
      const appName = document.getElementById('appName').value;
      const environment = document.getElementById('environment').value;

      fetch(
        `${window.baseUrl}${window.path}/config/${appName}/${environment}/${key}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: value,
            comment: comment,
            group: group,
          }),
        },
      )
        .then(() => {
          alert('Configuration saved successfully!');
          loadConfigurations();
        })
        .catch((error) => {
          console.error('Error saving configuration:', error);
          alert('Error saving configuration.');
        });
    }
  }

  document
    .getElementById('appName')
    .addEventListener('change', loadConfigurations);
  document
    .getElementById('environment')
    .addEventListener('change', loadConfigurations);
});
