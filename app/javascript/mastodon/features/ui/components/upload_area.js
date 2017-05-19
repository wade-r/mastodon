import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';
import { FormattedMessage } from 'react-intl';

class UploadArea extends React.PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    onClose: PropTypes.func
  };

  handleKeyUp = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const keyCode = e.keyCode
    if (this.props.active) {
      switch(keyCode) {
      case 27:
        this.props.onClose();
        break;
      }
    }
  }

  componentDidMount () {
    window.addEventListener('keyup', this.handleKeyUp, false);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  render () {
    const { active } = this.props;

    return (
      <Motion defaultStyle={{ backgroundOpacity: 0, backgroundScale: 0.95 }} style={{ backgroundOpacity: spring(active ? 1 : 0, { stiffness: 150, damping: 15 }), backgroundScale: spring(active ? 1 : 0.95, { stiffness: 200, damping: 3 }) }}>
        {({ backgroundOpacity, backgroundScale }) =>
          <div className='upload-area' style={{ visibility: active ? 'visible' : 'hidden', opacity: backgroundOpacity }}>
            <div className='upload-area__drop'>
              <div className='upload-area__background' style={{ transform: `translateZ(0) scale(${backgroundScale})` }} />
              <div className='upload-area__content'><FormattedMessage id='upload_area.title' defaultMessage='Drag & drop to upload' /></div>
            </div>
          </div>
        }
      </Motion>
    );
  }

}

export default UploadArea;
