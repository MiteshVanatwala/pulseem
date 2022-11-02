import React, { Component } from 'react'

export const customTool = ({ unlayer }) => {
  return {
    name: 'my_tool',
    label: 'My Tool',
    icon: 'fa-smile',
    supportedDisplayModes: ['web', 'email'],
    options: {},
    values: {},
    renderer: {
      Viewer: () => {
        return <div>I am a custom tool.</div>
      },
      exporters: {
        web: function(values) {
          return "<div>I am a custom tool.</div>"
        },
        email: function(values) {
          return "<div>I am a custom tool.</div>"
        }
      },
      head: {
        css: function(values) {},
        js: function(values) {}
      }
    },
    validator(data) {
      return [];
    },
  }
}
