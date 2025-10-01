module.exports = {
    "hook": {
        "installed": async (focusany) => {
            for (let i = 1; i < 5; i++) {
                focusany.addLaunch(`clipboard-paste-${i}`, `粘贴第${i}条`, {
                    key: i + '',
                    modifiers: ['Shift', focusany.isMacOs() ? 'Command' : 'Ctrl']
                });
            }
        },
        "beforeUninstall": async (focusany) => {
            for (let i = 1; i < 5; i++) {
                focusany.removeLaunch(`clipboard-paste-${i}`);
            }
        },
    },
}

