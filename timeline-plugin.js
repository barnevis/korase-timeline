import { markdownToOutput as marked } from "shahneshan";
import "./timeline-plugin.css";

function escapeHTML(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function convertToNumber(text) {
  const persianToEnglishMap = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  return Number(text.replace(/[\u06F0-\u06F9]/g, char => persianToEnglishMap[char]));
}

function renderTimelineItem(item) {
  return `
    <div class="timeline-item">
      <div class="timeline-item-content">
        ${item.image ? `<div class="box"><div class="image"><img src="${encodeURI(`/docs/${item.image}`)}" alt="Timeline Image"></div></div>` : ''}
        <div class="text">
          <h3>${escapeHTML(item.title)}</h3>
          <span>${escapeHTML(item.date)}</span>
          ${marked(item.description)}
        </div>
      </div>
      <div class="timeline-circle"></div>
    </div>
  `;
}

const timelinePlugin = {
  name: "timelinePlugin",
  beforeParse: (text) => {
    return text.replace(/\.{3}گاهشمار([\s\S]*?)\.{3}/g, (match, content) => {
      let maxWidth = '';
      const lines = content
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

      if (lines.length > 0 && /^[0-9\u06F0-\u06F9]*$/.test(lines[0])) {
        const size = convertToNumber(lines[0]);
        if (size) {
          maxWidth = `style="max-width: ${size}px;"`;
        }
      }

      let timelineHTML = `<div class="timeline"><div class="timeline-container" ${maxWidth}>`;
      let currentItem = null;

      lines.forEach(line => {
        if (line.startsWith('-')) {
          if (currentItem) {
            timelineHTML += renderTimelineItem(currentItem);
          }
          currentItem = { title: line.substring(1).trim(), image: '', date: '', description: '' };
        } else if (line.startsWith(':[[')) {
          currentItem.image = line.substring(3, line.length - 2).trim();
        } else if (line.startsWith(':سال')) {
          currentItem.date = line.substring(1).trim();
        } else if (line.startsWith(':')) {
          currentItem.description += line.substring(1) + '  \n';
        }
      });

      if (currentItem) {
        timelineHTML += renderTimelineItem(currentItem);
      }

      timelineHTML += '</div></div>';
      return timelineHTML;
    });
  }
};

export default timelinePlugin;
